from locust import HttpUser, task, between
import random
import string

def random_string(length=10):
    letters = string.ascii_lowercase
    return ''.join(random.choice(letters) for i in range(length))

class ShopperUser(HttpUser):
    wait_time = between(1, 4)
    
    def on_start(self):
        # Create a new user for each simulated client
        self.username = random_string()
        self.email = f"{self.username}@example.com"
        self.password = "password123"
        
        # Register
        self.client.post("/api/auth/register", json={
            "username": self.username,
            "email": self.email,
            "password": self.password
        })
        
        # Login
        response = self.client.post("/api/auth/login", json={
            "email": self.email,
            "password": self.password
        })
        if response.status_code == 200:
            self.token = response.json().get('token')
            self.headers = {'Authorization': f'Bearer {self.token}'}
        else:
            self.headers = {}
            self.token = None
            
        self.cart_items = []

    @task(3)
    def browse_products(self):
        categories = ['Electronics', 'Clothing', 'Home', 'Books', 'Toys', 'Sports', 'Beauty', ""]
        category = random.choice(categories)
        endpoint = "/api/products?limit=20"
        if category:
            endpoint += f"&category={category}"
        
        with self.client.get(endpoint, catch_response=True) as response:
            if response.status_code == 200:
                data = response.json()
                products = data.get('data', [])
                if products:
                    # Pick a random product from the list for the next tasks
                    self.current_product = random.choice(products)

    @task(2)
    def add_to_cart(self):
        if not self.token or not hasattr(self, 'current_product'):
            return
            
        self.client.post("/api/cart", json={
            "productId": self.current_product['_id'],
            "quantity": random.randint(1, 3)
        }, headers=self.headers)
        
        self.cart_items.append(self.current_product['_id'])

    @task(1)
    def checkout(self):
        if not self.token or not self.cart_items:
            return
            
        response = self.client.post("/api/orders", headers=self.headers)
        if response.status_code == 201:
            self.cart_items = [] # clear cart tracking
