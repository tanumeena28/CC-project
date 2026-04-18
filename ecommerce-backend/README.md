# Scalable E-Commerce Backend

This is a stateless REST API for an E-Commerce platform built with Node.js, Express, and MongoDB. It uses JWT for authentication and includes a Locust load testing script.

## Setup Instructions for WSL / Ubuntu

### 1. Install Node.js
If Node.js is not already installed on your WSL/Ubuntu system, you can use nvm (Node Version Manager):
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 20
```

### 2. Install MongoDB
To install MongoDB Community Edition on Ubuntu (e.g., 22.04):
```bash
# Import the public key used by the package management system
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
   sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg \
   --dearmor

# Create a list file for MongoDB
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Reload local package database and install
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB and enable it to start on boot
sudo systemctl start mongod
sudo systemctl enable mongod
```

*(Note: Depending on your WSL version, `systemctl` might not be available. If so, simply run `sudo mongod &` manually or upgrade your WSL config to support systemd).*

### 3. Setup the Application
Run the following inside the `ecommerce-backend/` directory:
```bash
# Install dependencies
npm install

# Seed the database with 5000 mock products
npm run seed

# Run the app locally for development
npm run dev
# OR for production
# npm start
```

### 4. Running the Load Test
The script `locustfile.py` helps simulate thousands of users using Locust.
```bash
# Install locust (Python 3 and pip required)
sudo apt install python3-pip -y
pip install locust

# Run locust
locust -f locustfile.py --host=http://localhost:5000
```
Then navigate to `http://localhost:8089` in your windows browser to launch the stress test GUI.

### 5. Deployment with Systemd
This repository includes an `ecommerce-backend.service` file. Once your app is physically on the desired Linux deployment server:

```bash
# Move and edit the service file with correct user/paths
sudo cp ecommerce-backend.service /etc/systemd/system/
sudo vim /etc/systemd/system/ecommerce-backend.service 

# Reload daemon and start service
sudo systemctl daemon-reload
sudo systemctl start ecommerce-backend
sudo systemctl enable ecommerce-backend

# Check status
sudo systemctl status ecommerce-backend
```
