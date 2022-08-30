#!/bin/bash
echo "pasta installer for mac"

echo "install docker desktop"
sudo brew install --cask docker

echo "install node.js"
sudo brew install node

echo "install python 3.9"
sudo brew install python@3.9

echo "install git"
sudo brew install git

echo "install curl"
sudo brew install curl

echo "pulling pasta image and run container"

sudo docker pull pythoscorpion/pasta:pasta
sudo docker run -d --name pasta -p 5984:5984 pythoscorpion/pasta:pasta

echo "wait for 5 seconds ..."
sleep 5s

echo "intial couchdb databases"

curl -X PUT http://admin:123456@127.0.0.1:5984/_users
curl -X PUT http://admin:123456@127.0.0.1:5984/_replicator
curl -X PUT http://admin:123456@127.0.0.1:5984/_global_changes

sleep 5s

cd ~
echo "cloning project files"
sudo git clone --verbose --progress https://github.com/pythoscorpion/PASTA_ELN_MAC.git
sudo mv  -v ~/PASTA_ELN_MAC/* ~

sleep 5s

echo "Install python dependencies."
cd Python
pip3 install -r requirements.txt
echo

pip3 install cloudant
python3 -m pip install --upgrade pip
python3 -m pip install --upgrade Pillow
pip3 install cloudant
python3 -m pip install --upgrade js2py

sleep 5s

echo "run tests"

sudo python3 pastaELN.py test
sleep 2s
sudo python3 pastaELN.py extractorScan
sleep 2s  
sudo python3 Tests/verifyInstallation.py

cd ..
cd pasta

echo "installing electron packages"

sudo npm install

sleep 2s

echo "** pasta installed **"
