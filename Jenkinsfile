
def buildNumber = env.BUILD_NUMBER as int
if (buildNumber > 1) milestone(buildNumber - 1)
milestone(buildNumber)

def branchrepo= 'development'
def appname = 'chat-engine-service'
def ocp_project='marketplace'
def version = '0.0.1'
def image = 'quay.io/centos7/nodejs-14-centos7'
def reponame= 'https://code.mylabzolution.com/marketplace/chat-engine-service.git'
pipeline {
agent { node { label 'nodejs' } }
stages {
 stage("Code Checkout from GitLab") {
  steps {
  git url: "${reponame}", branch: "${branchrepo}", credentialsId: 'gagah'
  }
 }
    stage ('OpenShift Login') {
        steps {
                withCredentials([[$class: 'UsernamePasswordMultiBinding',
            credentialsId: 'okd-dev-mar',
            usernameVariable: 'oc_username', passwordVariable: 'oc_password']]) {
                    sh 'oc login -u=${oc_username} -p=${oc_password} https://okd.istdigiplatform.com:8443/ --insecure-skip-tls-verify=true'
                    
                }
                sh "oc project ${ocp_project}"
            }
        }
    stage ('openshift create deployment'){
        steps {
                sh "oc new-app ${image}~${reponame}#${branchrepo} --name ${appname} -n marketplace --labels='project=marketplace' || echo 'app exists'"
				sh "sleep 30"
				sh "oc set triggers bc/${appname} --from-image=${ocp_project}/${appname}:${version}"
             }
        }

    stage ('install dependencies'){
        steps{
            sh """
                npm cache clean --force
                rm package-lock.json || true
                rm -r node_modules || true
                CHROMEDRIVER_SKIP_DOWNLOAD=true
                rm -f .npmrc
                npm install
            """
        }
    }
    
    stage ('openshift build and deploy'){
        steps {
        sh """
            oc project ${ocp_project}
            oc start-build ${appname} --from-dir=. --follow
            """
        }
    }
    //stage ('openshift set image version'){
    //    steps {
    //    sh """
    //        oc patch dc/${appname} -p '[{"op": "replace", "path": "/spec/triggers/1/imageChangeParams/from/name", "value":"${appname}:${version}"}]' --type=json
    //        """
    //    }
    //}
    
    //stage ('Create Route') {
    //    steps {
    //    echo 'Creating a route to application'
    //    createRoute(appname)
    //    }
    //}
    //stage('ssl route setting '){
    //steps {
    // sh "oc create route edge ${appname} --service ${appname} || echo 'router exists ssl'"
    //  }
    //}
    
    }   
}

def createRoute(String name) {
    try {
        def service = getServiceName(name)
        sh "oc expose svc ${service}"
    } catch(Exception e) {
        echo "route exists"
    }    
}
def getServiceName(String name) {
    def cmd4 = $/service=$(oc get svc -l app=${name} -o name);echo $${service##service*/}/$
    svc = sh(returnStdout: true, script: cmd4).trim()        
    return svc
}
