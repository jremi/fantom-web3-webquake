# dApp

This template should help get you started developing / configuring dApp.

## Environment variables

```sh
cp .env.example .env
```

Update the .env environment variables:

- `VITE_FANTOM_SMART_CONTRACT_ADDRESS` - The smart contract deployed via the instructions found within the **/HardHat/README.md**. 
> The value will be an actual smart contract address(e.g: `0x0000000000000000000000000000000000000000`)

- `VITE_WEB_QUAKE_SERVER` -The host running the WebQuake server. The setup instructions can be found within **/WebQuakeServer/README.md** 
> The value will be an actual private/public host (e.g: `http://192.168.1.1:26000`). 

## Connecting to dApp

```
http://<CLIENT_HOST>/?+connect%20ws://<SERVER_HOST>:26000
```
> In the above example the `<CLIENT_HOST>` would be replaced with the public or private hostname/ip that is running the deployed build of the `/dApp`. The `<SERVER_HOST>` would be replaced with the public or private hostname/ip of the deployed `/WebQuakeServer` folder.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur) + [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin).

## Customize configuration

See [Vite Configuration Reference](https://vitejs.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```
