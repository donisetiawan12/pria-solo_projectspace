exports.getGithubZip = (url) => {
  try {
    if (!url) return null;

    // contoh:
    // https://github.com/user/repo
    const parts = url.split('github.com/')[1];

    if (!parts) return null;

    return `https://github.com/${parts}/archive/refs/heads/main.zip`;
  } catch (err) {
    return null;
  }
};