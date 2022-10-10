#!/bin/bash
echo "pasta installer for mac"


echo "pulling pasta image and run container"

sudo docker pull ashouricsa/pasta:pasta
sudo docker run -e COUCHDB_USER=admin -e COUCHDB_PASSWORD=123456 -d --name pasta -p 5984:5984 ashouricsa/pasta:pasta

echo "wait for 10 seconds ..."
sleep 10s

echo "intial couchdb databases"

curl -X PUT http://admin:123456@127.0.0.1:5984/_users
curl -X PUT http://admin:123456@127.0.0.1:5984/_replicator
curl -X PUT http://admin:123456@127.0.0.1:5984/_global_changes

sleep 5s

cd ~
echo "cloning project files"
sudo git clone --verbose --progress https://github.com/pythoscorpion/pastaELN_desktop.git
sudo mv  -v ~/pastaELN_desktop/* ~

sleep 5s

echo "Install python dependencies."
cd Python
pip3 install -r requirements.txt
pip3 install -r requirements_full.txt
echo

pip3 install cloudant
python3 -m pip install --upgrade pip
python3 -m pip install --upgrade Pillow
pip3 install cloudant
python3 -m pip install --upgrade js2py
python3 -m pip install cryptography
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
