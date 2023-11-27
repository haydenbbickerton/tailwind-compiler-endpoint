


[Demo with REPL](https://play.vuejs.org/#eNqNVuFu4zYMfhXNh6EOljjt5boNXhrcduiwHrDrsPbfPOBkW451lSVBkpN6Rd99pGQ7btpu1wKtRVLUR/IjpYfoZ62TXcuiNFrbwnDtiGWu1ZtM8kYr48gDMawij6QyqiFZBLZZ9FMmM1koaR35YpW8krp15AIN4yzKohnog9Ywq+GDXbfuNRPb5g13jsttr66osAz1g0WlTEOdP+SW3btc3YNlPCMXG/KQSUKc6cIHOaBJdlS0DOw+3lx/Sqwz4J9XXeyXmhrL4iPb2ZzIVog5eYdnE4i4oK6oScxmg3cqmHEA/0rCDl563yEUMM/k4wRziGpIzATsIdwRojMt8z4qBgeC/9o5bdPl0lEu9lyWi0I1msPhCyZLrbh0iWROQDwJ1XpJNc+i+QCyYa5WZQql+uP65hYUQVwzWjJjU6hnFn1Q0jHpFredhmqiLfgRHALmSi4xMVlEHvuduSq79DizXvc4CxaJq5mM46HYPthhkeDGePbUsqSOHlKCP0+J8lr1cN9Qprch7xMUvl5xzIxR5qu8Z9El2mL85Dvi9x37rLikQnTxpIL480IVPW3H7fAR6PC/jPQ+gTRYkJR8xtW65DtSCGrtxUmvWdDWqRPoSnS/rs8GtYOGWKzuBfEfBXACuqU82fzGhFBkr4wov1kv6zO/c70Ex5vPvnaFBS74094PNCM57SM4iJB5SgIAe6RoHRfccYZyrxG0Y+YgHnKVTAM4JHAMebHjlue4CUiGNkMKPcECVi3aLZeA968sGhFAAEucDBa5fyR3nVZbQ3XdZdHf3gXwrmFA/uAccgWdNC4RjFC+OSb4+lwiO96UdPXDqhybCZD1X+E//vU1fz6qYhSvl2G2QhVg4VijBXUs1ARHLXpCe6IkIiWCVY7suRAkZwTbmJUEsocqaPY5oVAAXAy8JiW34LIDM2hd786r+bZ2CblypKEdcfSOkVajo7NTmPJQgNImgRcIwn/lrXMA4j1EX9xdZNHzgLJo86sXrpfBOIRxvHEyAKG7UgBIc8HKUYO9A65u/GLi6oj/WcRK7pQB0577Ux0P7nsVKLELqGF0tMD2QyFg2C0aVTLRC3tkm/Vy2DMc4JvkhcOUHx7T0wrw9/JJtWvwoKdzx5+Ge56dNHwhmJEbsLSuE/iZhCQEeva1Tkkl2L3vlpphoVO4sEQR/3i+q/34QQ+JzxCwMwnogwe1Y6YSaj9puD0vXZ2S89Nvn3g8O+0FOS3utka1/jKCXknJm+p7/A0XF4S+sPwf6LCzdzqA8rKKNlwA1Cz6XUlaKOzVQrWGMzMnjZLKalqEmZNDr8EN5zmbkpW+J1bhJfvm/PzcG2halkCalLw99UeEAIe0h8iCk5RImFl+E1TAwxoFkAfB5VQy5jMXqrh7Ofw+PV+ZjhFpAAp3MjUwwIY1AIeB0Jc2mkfOQitWfOtjgYeYjySLhkv/WuOtDGNuHE9wXcN033/0Mnw99MMI9tSsuHtB/sVC3/o3ASSEmR3c+qMOyL9lQE5UX9588hQeldAyrejfCK8o/2RQKJj7+GhAs18gKwB7YufRXvnnJKTl1l7i+LVDUAh0GKJoDS/MD/8R+gHuKlkNL6/o8V/u45kP)

[codepen demo](https://codepen.io/haydenbbickerton/pen/QWYQQBE)

# Tailwind Compiler Endpoint

Inspired by the [Official Tailwind Playground](https://play.tailwindcss.com/), this endpoint enables the use of Tailwind without node tooling (`npm`/`node_modules`/`PostCSS`/etc). Just POST an object with your html content and tailwind config and recieve the tailwind-cli generated CSS ready for use in the browser.

Api endpoint to generate Tailwind Css without a nodejs environment










This repository contains an AWS Lambda handler for dynamically processing Tailwind CSS configurations and generating CSS. It's designed to work seamlessly within Netlify's environment, using a standalone binary of the Tailwind CSS CLI.



### Example

POST this payload to the endpoint:
```js

const css = `
    @tailwind base;
    @tailwind components;
    @tailwind utilities;

    @layer utilities {
      .content-auto {
          content-visibility: auto;
      }
    }`

const content = `
    <div class='content-auto'>
      <h1 class='text-3xl text-clifford'>Hello world!</h1>
    </div>`


const body = JSON.stringify({
  content,
  css,
  plugins: ["@tailwindcss/forms", "@tailwindcss/typography"],
  theme: {
    extend: {
      colors: {
        clifford: "#da373d",
      },
    },
  },
});

fetch("https://tailwind-compiler-endpoint.netlify.app/api", {
    body,
    method: "POST",
    headers: { "Content-Type": "application/json" }
  })
```



## API Reference

- **Endpoint**: `https://tailwind-compiler-endpoint.netlify.app/api`
- **Method**: `POST`
- **Headers**: 
  - `Content-Type`: `application/json`
- **Body**:
  ```json
  {
    "css": "/* Your CSS here */",
    "content": "<html>Your HTML here</html>",
    "theme": {},
    "plugins": [],
    "options": {}
  }
  ```
