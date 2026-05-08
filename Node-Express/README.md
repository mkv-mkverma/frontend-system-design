## Setup of simple Node Express Server

mkdir node-express
cd node-express

npm init -y

npm i express

# for watch mode optional

npm i nodemon -D

update package.json

"scripts": {
"start": "node index.js",
"start-watch": "nodemon index.js",
},

now create

- index.html
- index.js
- index.css

use node version above 14 if facing issue
node index.js

# check node version

node -v
nvm list
nvm use

http://localhost:3000/api/hello

````md
# Request & Response Simple Flow

## Client Side

```js
const response = await fetch("/api");
```
````

- Client sends REQUEST
- Client receives RESPONSE

---

## Server Side

```js
app.get("/user", (req, res) => {});
```

```txt
req = receive request
res = send response
```

---

# Flow

Frontend / Client
|
| REQUEST
v
Server Route (req)
|
| Process logic
v
Server sends RESPONSE (res)
|
v
Frontend receives data

---

# Simple Memory Trick

Client:
fetch() → send request

Server:
req → receive request
res → send response

Client:
response → receive response

```

```
