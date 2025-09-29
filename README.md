# dynamic-env-cli

A simple Node.js CLI tool and runtime helper to inject and access environment variables dynamically in frontend JavaScript files, especially useful for static sites served via Nginx.

---

## 🚀 Features

- Generates a `run.sh` script that:
  - Serializes environment variables into a string.
  - Replaces `___ENV-VARIABLES___` placeholder in built `.js` files.
  - Starts the Nginx server.
- Provides a runtime function to access environment variables using `getEnvVariable`.
- Supports both `development` (from `.env` or system) and `production` (injected string) environments.

---

## 📦 Installation

Install globally:

```bash
npm install -g dynamic-env-cli
```

Or use it locally:

```bash
npm install dynamic-env-cli --save
```

---

## 🔧 Usage

### 1. Adding dynamic-env-cli to your build script

Add the CLI tool to your build script in `package.json`:

```json
{
  "scripts": {
    "build": "your-build-command && dynamic-env-cli"
  }
}
```

### 2. Build your frontend project (e.g., React, Vue, etc.)

```bash
npm run build
```

Ensure your build output is in a `dist/` or `build/` directory.


### 3. Run the generated script

```bash
./dist/run.sh
```

or

```bash
./build/run.sh
```

---

## 🧠 Accessing Environment Variables in Code

```ts
import { getEnvVariable } from 'dynamic-env-cli';

const apiHost = getEnvVariable('API_HOST');
console.log('API Host:', apiHost);
```

- In **development**, it returns the value from `process.env`.
- In **production**, it parses the injected `___ENV-VARIABLES___` string and retrieves the variable.

---



## 📝 Example Workflow

```bash
# Build your frontend app
npm run build

./build/run.sh 
```

---

## 🐳 Dockerfile Example

You can use the package inside a Docker container to prepare and serve a frontend app.


```Dockerfile

FROM node:20 AS builder

WORKDIR /app

COPY . .

RUN npm install 

RUN npm run build

FROM nginx:alpine

WORKDIR /usr/share/nginx/html

# Copy build output from builder stage (adjust to your build output folder)
COPY --from=builder /app/build/ .

CMD ["sh", "-c", "sh run.sh --nginx"]
```

### ✅ Build and Run the Docker Image

```bash
docker build -t your-app .
docker run -p 80:80 --env-file .env your-app
```

> 💡 Ensure your `.env` file is available at build time or mount it at runtime using `--env-file`.

---

## ⚠️ Error Handling

If the environment variables are not injected in production, the library will log a error and fallback will fail gracefully:

```
[ERROR] Environment variables are not injected yet.
Please ensure the "run.sh" script has executed successfully.
```



---

## 👤 Author

Artur Aleksanyan