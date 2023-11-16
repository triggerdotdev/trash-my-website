# Trash my website by [Trigger.dev](https://trigger.dev)

Welcome to Trash my website! Try it for free [here](https://trashmywebsite.ai).

## Contributing

### web server

First, install dependencies and run the development server:

```bash
npm i
```

For this step, you'll need to [create an account on Trigger.dev](https://cloud.trigger.dev/login?redirectTo=%2F). You can log in with your GitHub account.

To link the **jobs/** directory to [Trigger.dev](https://trigger.dev), clone and populate the **.env** file with your Trigger.dev keys, then run the [Trigger.dev CLI](https://trigger.dev/docs/documentation/guides/cli):

```bash
cp .env.example .env.local
```

```bash
npm run dev
```

In a separate terminal run:

```bash
npx @trigger.dev/cli@latest dev
```

This may require installing or updating the CLI. When linked, you should see a message like this:

```text
✅ Detected TriggerClient id: jobs-abcd
✅ Found API Key in .env.local file
✅ Created tunnel: abc123.ngrok.app

```

Open [localhost:3000](http://localhost:3000) in your browser to see the result.

### Puppeteer Cloudflare worker

```bash
cd ./puppeteer
```

Populate the **env** vars:

```bash
cp .dev.vars.example .dev.vars
```

```bash
npm i
```

```bash
npm run dev
```

## Learn More

To learn more about Trigger.dev, see our Getting Started guide!

- [Trigger.dev Documentation](https://trigger.dev/docs/documentation/introduction) - learn about the Trigger.dev platform and SDK.
- [Trigger.dev Next.js quickstart](https://trigger.dev/docs/documentation/quickstarts/nextjs) - the fastest way to learn.

You can check out [the Trigger.dev GitHub repository](https://github.com/triggerdotdev/trigger.dev) - your feedback and contributions are welcome!
