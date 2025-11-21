pipeline {
    agent any

    environment {
        IMAGE_NAME     = "express-app"
        CONTAINER_NAME = "express_app"
        HOST_PORT      = "3000"
        CONTAINER_PORT = "3000"
    }

    stages {
        stage('Check Environment') {
            steps {
                sh '''
                    node -v
                    npm -v
                    docker --version
                '''
            }
        }

        stage('Clone Repository') {
            steps {
                git branch: 'main', url: 'https://github.com/dwikysahut/express-training.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Build Docker Image') {
            steps {
                sh "docker build -t ${IMAGE_NAME} ."
            }
        }

        stage('Stop & Remove Existing Container') {
            steps {
                sh '''
                    docker stop ${CONTAINER_NAME} || true
                    docker rm ${CONTAINER_NAME} || true
                '''
            }
        }

        stage('Run Docker Container') {
            steps {
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
                sh 'docker ps --filter name=${CONTAINER_NAME}'
            }
        }
    }
}
