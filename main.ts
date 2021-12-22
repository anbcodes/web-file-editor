import { Application } from "https://deno.land/x/oak/mod.ts";

const app = new Application();
const path = Deno.args[0];

const htmlString = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Data Dump</title>
    <style>
      textarea {
        padding: 10px;
        width: 97vw;
        height: 66vh;
        line-height: 1.5;
        border-radius: 5px;
        border: 1px solid #ccc;
        box-shadow: 1px 1px 1px #999;
        font-family: monospace;
        outline: none;
        overflow: scroll;
      }
      body {
        margin: 0px 7px;
        padding: 0px;
        height: 100%;
      }
      html {
        min-height: 100vh;
        padding: 0px;
        margin: 0px;
        overflow: hidden;
      }
      textarea:focus {
        outline: none;
        border: 1px solid #aaa;
      }
      form {
        display: flex;
        flex-direction: column;
      }
      input[type="submit"] {
        padding: 10px;
        font-size: 125%;
        background-color: white;
        border-radius: 5px;
        border: 1px solid #ccc;
        box-shadow: 1px 1px 1px #999;
        flex-grow: 0;
        margin: 10px 0px;
        width: 200px;
      }
      input[type="submit"]:hover {
        background-color: #ededed;
      }
    </style>
</head>
<body>
    <h1>Welcome to the data dump</h1>
    <p>{{MESSAGE}}</p>
    <form method="post" action="/">
        <input type="submit" value="Save">
        <textarea name="text">{{FILE}}</textarea>
    </form>
</body>
</html>
`

let fileString = await Deno.readTextFile(path);

app.use(async (ctx) => {
  if (ctx.request.url.pathname === '/' && ctx.request.method === 'GET') {
    ctx.response.body = htmlString.replace(/{{FILE}}/, fileString).replace(/{{MESSAGE}}/, '')
  } else if (ctx.request.url.pathname === '/' && ctx.request.method === 'POST') {
    const toSet = (await ctx.request.body({
      type: "form"
    }).value).get('text')
    if (toSet === null) {
      ctx.response.body = htmlString.replace(/{{FILE}}/, fileString).replace(/{{MESSAGE}}/, 'Failed to save file')
      return;
    }
    fileString = toSet;
    Deno.writeTextFileSync(path, fileString)
    ctx.response.body = htmlString.replace(/{{FILE}}/, fileString).replace(/{{MESSAGE}}/, 'Saved file')
  }
});

await app.listen({ port: 8000 });
