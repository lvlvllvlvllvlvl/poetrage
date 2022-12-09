## TODO

- Check for inconsistent pricing (corrupted gem worth more than identical uncorrupted)
- Ability to override gem pricing
- Vendors
- Don't recalculate everything when changing temple price
- Remove axios cache, store computed values in sessionstorage

---

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm run prettier`

Formats the code. You can add this to your git pre-commit hook with `echo 'npm run prettier' >> .git/hooks/pre-commit`

### `npm run deploy`

Builds and deploys to gh-pages (you will need to update the `homepage` value in package.json if you change the repo name)
