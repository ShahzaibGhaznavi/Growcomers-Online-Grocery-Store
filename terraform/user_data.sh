#!/bin/bash

set -e

LOG_FILE="/var/log/growcomers-user-data.log"
exec > >(tee -a "$LOG_FILE") 2>&1

echo "=== Growcomers EC2 bootstrap started ==="

# Update system
apt-get update -y
apt-get upgrade -y

# Required packages
apt-get install -y \
  ca-certificates \
  curl \
  unzip \
  gnupg

# Docker official GPG key
install -m 0755 -d /etc/apt/keyrings

curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
  -o /etc/apt/keyrings/docker.asc

chmod a+r /etc/apt/keyrings/docker.asc

# Docker repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
  > /etc/apt/sources.list.d/docker.list

# Install Docker
apt-get update -y

apt-get install -y \
  docker-ce \
  docker-ce-cli \
  containerd.io \
  docker-buildx-plugin \
  docker-compose-plugin

# Start Docker
systemctl enable docker
systemctl start docker

# Allow ubuntu user to use Docker without sudo
usermod -aG docker ubuntu

# Install AWS CLI v2
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" \
  -o /tmp/awscliv2.zip

unzip -q /tmp/awscliv2.zip -d /tmp

/tmp/aws/install

rm -rf /tmp/aws /tmp/awscliv2.zip

# Verify installations
docker --version
docker compose version
aws --version

echo "=== Growcomers EC2 bootstrap completed ==="