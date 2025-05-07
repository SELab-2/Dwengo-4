import app from "./index";
import { logger } from "./utils/logger";

const PORT: string | 5000 = process.env.PORT || 5000;
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, (): void => {
    logger.info(`Server is running on port ${PORT}`);
  });
}
