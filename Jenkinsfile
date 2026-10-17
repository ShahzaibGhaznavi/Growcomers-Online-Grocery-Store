pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Frontend Build') {
            steps {
                dir('frontend') {
                    sh 'npm ci'
                    sh 'npm run build'
                }
            }
        }

        stage('Python Syntax Check') {
            steps {
                sh 'python3 -m py_compile pythonBackend/app.py pythonBackend/db.py'
            }
        }

        stage('Docker Build') {
            steps {
                sh 'docker build -t growcomers-frontend:ci --build-arg VITE_NODE_API_URL=http://localhost:4000 --build-arg VITE_PYTHON_API_URL=http://localhost:5000 ./frontend'
                sh 'docker build -t growcomers-backend:ci ./nodeBackend'
                sh 'docker build -t growcomers-python-backend:ci ./pythonBackend'
            }
        }

        stage('Trivy Security Scan') {
            steps {
                sh 'trivy image --ignore-unfixed --severity HIGH,CRITICAL --exit-code 1 growcomers-frontend:ci'
                sh 'trivy image --ignore-unfixed --severity HIGH,CRITICAL --exit-code 1 growcomers-backend:ci'
                sh 'trivy image --ignore-unfixed --severity HIGH,CRITICAL --exit-code 1 growcomers-python-backend:ci'
            }
        }
    }
}
