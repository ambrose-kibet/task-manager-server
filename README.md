<a name="readme-top"></a>

<div align="center">
  <br/>
  <h3><b>Task Manger API </b></h3>

</div>

<!-- TABLE OF CONTENTS -->

# 📗 Table of Contents

- [📖 About the Project](#about-project)
  - [🛠 Built With](#built-with)
    - [Tech Stack](#tech-stack)
    - [Key Features](#key-features)
  - [🚀 Live Demo](#live-demo)
- [💻 Getting Started](#getting-started)
  - [Setup](#setup)
  - [Prerequisites](#prerequisites)
  - [Install](#install)
  - [Usage](#usage)
- [👥 Authors](#authors)
- [🔭 Future Features](#future-features)
- [🤝 Contributing](#contributing)
- [⭐️ Show your support](#support)
- [📝 License](#license)

<!-- PROJECT DESCRIPTION -->

# 📖 Task Manager API <a name="about-project"></a>

**Task Manager API** Is a REST API crafted with Nest.js and Postgresql DB . This API allows the user to to add,view, delete tasks and keep track of their productivity.

## 🛠 Built With <a name="built-with"></a>

### Tech Stack <a name="tech-stack"></a>

<details>
  <summary>Server</summary>
  <ul>
    <li><a href="https://docs.nestjs.com/">Nest.js</a></li>
  </ul>
</details>

<details>
<summary>Database</summary>
  <ul>
    <li><a href="https://www.postgresql.org/">Postgresql</a></li>
  </ul>
</details>

<!-- Features -->

### Key Features <a name="key-features"></a>

- **Create Tasks**
- **OAuth authentication**
- **productivity stats**

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- LIVE DEMO -->

## 🚀 Live Docs <a name="live-demo"></a>

- [Live Docs Link](https://chativerse-api.onrender.com/)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- GETTING STARTED -->

## 💻 Getting Started <a name="getting-started"></a>

To get a local copy up and running, follow these steps.

### Prerequisites

In order to run this project you need:

- [ ] NodeJs installed on your computer
- [ ] Postgresql database

### Setup

Clone this repository to your desired folder:

```sh
  cd my-folder
  git https://github.com/ambrose-kibet/task-manager-server.git
```

### Install

Install this project with:

```sh
  cd task-manager-server
  npm install
```

### Prerequisites

create a `.env` file at the root of the project with the following vars

```ts

DATABASE_URL=//postgres db url

JWT_ACCESS_TOKEN_SECRET=//jwt access  token secret eg'my secret'
JWT_ACCESS_TOKEN_EXPIRATION_TIME=// jwt access token expiration time eg'45m'
JWT_REFRESH_TOKEN_SECRET=// jwt refresh  token secret eg'my other secret'
JWT_REFRESH_TOKEN_EXPIRATION_TIME=// jwt access token expiration time eg'10d'

GOOGLE_CLIENT_ID=//google client id
GOOGLE_CLIENT_SECRET=//google client secret
GOOGLE_CALLBACK_URL=//google callback url eg 'http://localhost:3000/auth/google/callback'

GITHUB_CLIENT_ID=//github client id
GITHUB_CLIENT_SECRET=//github client secret
GITHUB_CALLBACK_URL=//github callback url eg 'http://localhost:3000/auth/github/callback'

EMAIL_HOST="gmail"
EMAIL_PORT=587
EMAIL_USER=//your email
EMAIL_PASSWORD=// your password



CLIENT_URL=//client url

JWT_EMAIL_SECRET=//jwt email secret eg "my email secret"
JWT_EMAIL_EXPIRATION_TIME=//jwt email expiration time eg '30m'

JWT_PASSWORD_SECRET=//jwt password secret eg "my email secret"
JWT_PASSWORD_EXPIRATION_TIME=//jwt password expiration time eg '30m'

CLOUDINARY_CLOUD_NAME=//cloudinary cloud name
CLOUDINARY_API_KEY=// cloudinary api key
CLOUDINARY_API_SECRET=//cloudinary api secret

JWT_AUTH_TOKEN_SECRET=//jwt auth token secret eg "my email secret"
JWT_AUTH_TOKEN_EXPIRATION_TIME=//jwt auth token expiration time eg '1m'
```

### Usage

To run the project, execute the following command:

```sh
  npm run start:dev
```

<!-- AUTHORS -->

## 👥 Authors <a name="authors"></a>

👤 **Ambrose kibet**

- GitHub: [ambrose kibet](https://github.com/ambrose-kibet)
- Twitter: [ambrose kibet](https://twitter.com/ambrose_kibet)
- LinkedIn: [ambrose kibet](https://www.linkedin.com/in/ambrose-kibet/)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- FUTURE FEATURES -->

## 🔭 Future Features <a name="future-features"></a>

- [ ] **Unit tests**
- [ ] **E2E tests**

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTRIBUTING -->

## 🤝 Contributing <a name="contributing"></a>

Contributions, issues, and feature requests are welcome!

Feel free to check the [issues page](../../issues/).

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- SUPPORT -->

## ⭐️ Show your support <a name="support"></a>

If you like this project star ⭐️ it.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- LICENSE -->

## 📝 License <a name="license"></a>

This project is [MIT](./LICENSE) licensed.

<p align="right">(<a href="#readme-top">back to top</a>)</p>
