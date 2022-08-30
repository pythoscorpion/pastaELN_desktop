## PASTA-ELN for macOS (couchdb dockerized)

#### Installation
- install homebrew
  ```
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
  ```
- install python3 (if python3 is not available from terminal) 
  ```
  brew install python@3.9
  ```
- install git
  ```
  brew install git
  ```
- install latest Node.js
  ```
  brew install node
  ```
- install docker desktop
  ```
  brew install --cask docker
  ```
- start docker desktop from applications
- place install.sh into root directory
- open terminal and execute "sudo chmod 755 install.sh"
- start installation script by executing "./install.sh"

#### Usage
- start couchdb container
  ```
  docker start pasta
  ```
- change current directory
  ```
  cd ~/pasta
  ```
- start pasta electron app
  ```
  sudo npm start
  ```
