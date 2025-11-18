import app from "./app";
import "dotenv/config";
import { ensureBucket } from "./utils/minio";

ensureBucket();

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API rodando na porta ${PORT}`));