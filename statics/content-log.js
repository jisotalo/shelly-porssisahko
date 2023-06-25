let latestLogTimestamp = -1;

const runLogUpdater = async () => {
  try {
    await updateLog();
  } catch { }

  setTimeout(runLogUpdater, 20000);
};

const updateLog = async () => {
  debug(me(), "updating log");
  try {
    const res = await getData(`${BASE_SCRIPT_URL}?req=api-log&last=${latestLogTimestamp}`);

    if (res.success && res.statusCode === 200) {
      const data = res.data;
      const log = res.data.reverse();
      latestLogTimestamp = log[0].ts;

      const logHtml = log.map(line => `${formatDateTime(new Date(line.ts * 1000))} - ${line.str}\u000A`);
      qs("#porssi-log").innerHTML = logHtml.join("");

    } else if (res.success && res.statusCode === 204) {
      debug(me(), "No new data for log");

    } else {
      debug(me(), "Failed to read log:", res);
      console.error("Failed to read log:", res);
    }
  } catch (err) {
    debug(me(), "Error reading log: ", err);
    console.error("Error reading log: ", err);
  }
};

const logOnLoad = async () => {
  debug(me(), "onload begin");
  toggleLoading("Ladataan lokia...");
  await runLogUpdater();
  toggleLoading();
  debug(me(), "onload done");
};

logOnLoad();