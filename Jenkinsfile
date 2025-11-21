pipeline {
agent any

environment {
    IMAGE_NAME       = "express-app"
    CONTAINER_NAME   = "express_app"
    HOST_PORT        = "3000"
    CONTAINER_PORT   = "3000"
}

stages {
    stage('Run in Node Container') {
        steps {
            script {
                docker.image('node:18').inside('-v /var/run/docker.sock:/var/run/docker.sock') {

                    stage('Check Environment') {
                        sh '''
                            echo "Node version:" && node -v
                            echo "NPM version:" && npm -v
                            echo "Docker version:" && docker --version
                            echo "Hostname:" && hostname
                        '''
                    }

                    stage('Clone Repository') {
                        sh 'git clone -b main https://github.com/dwikysahut/express-training.git repo'
                    }

                    stage('Install Dependencies') {
                        dir('repo') {
                            sh 'npm install'
                        }
                    }

                    stage('Build Docker Image') {
                        dir('repo') {
                            sh "docker build -t ${IMAGE_NAME} ."
                        }
                    }

                    stage('Stop & Remove Existing Container') {
                        sh '''
                            docker stop ${CONTAINER_NAME} || true
                            docker rm ${CONTAINER_NAME} || true
                        '''
                    }

                    stage('Run Docker Container') {
                        sh """
                            docker run -d \
                                --name ${CONTAINER_NAME} \
                                -p ${HOST_PORT}:${CONTAINER_PORT} \
                                --restart unless-stopped \
                                ${IMAGE_NAME}
                        """
                    }

                    stage('Verify Container Running') {
                        sh "docker ps --filter name=${CONTAINER_NAME}"
                    }

                }
            }
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