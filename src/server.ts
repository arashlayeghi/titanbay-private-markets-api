import { app } from './app';
import { config } from './config';

const { port, nodeEnv } = config;

app.listen(port, (): void => {
  console.info(`Server running on port ${port} in ${nodeEnv} mode`);
});
