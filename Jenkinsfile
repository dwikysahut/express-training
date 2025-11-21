pipeline {
    agent {
        docker {
            image 'node:18'
            args '-v /var/run/docker.sock:/var/run/docker.sock'
        }
    }

    environment {
        IMAGE_NAME = "express-app"
        CONTAINER_NAME = "express_app"
        HOST_PORT = "3000"
        CONTAINER_PORT = "3000"
    }

    stages {
        stage('Build Docker Image') {
            steps {
                sh 'docker build -t express-app .'
            }
        }
        stage('Check Environment') {
            steps {
                sh 'echo "Node version:" && node -v'
                sh 'echo "NPM version:" && npm -v'
                sh 'echo "Docker version:" && docker --version'
                sh 'echo "Hostname:" && hostname'
            }
        }
        stage('Clone Repository') {
            steps {
                echo "Cloning repository..."
                git branch: 'main', url: 'https://github.com/dwikysahut/express-training.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                echo "Installing npm dependencies..."
                sh 'npm install'
            }
        }

        stage('Build Docker Image') {
            steps {
                echo "Building Docker image..."
                sh "docker build -t ${IMAGE_NAME} ."
            }
        }

        stage('Stop & Remove Existing Container') {
            steps {
                echo "Stopping and removing old container if exists..."
                sh "docker stop ${CONTAINER_NAME} || true"
                sh "docker rm ${CONTAINER_NAME} || true"
            }
        }

        stage('Run Docker Container') {
            steps {
                echo "Running Docker container..."
                sh """
                docker run -d \
                    --name ${CONTAINER_NAME} \
                    -p ${HOST_PORT}:${CONTAINER_PORT} \
                    --restart unless-stopped \
                    ${IMAGE_NAME}
                """
            }
        }

        stage('Verify Container Running') {
            steps {
                echo "Verifying container status..."
                sh "docker ps --filter name=${CONTAINER_NAME}"
            }
        }
    }

    post {
        always {
            echo "Pipeline finished. Current running containers:"
            sh "docker ps"
        }
        success {
            echo "Pipeline completed successfully!"
        }
        failure {
            echo "Pipeline failed. Check logs above."
        }
    }
}
