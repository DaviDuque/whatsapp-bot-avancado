declare namespace NodeJS {
    interface ProcessEnv {
      URL_OPENAI: string;
      OPENAI_API_KEY: string;
      AUDIO_MP3_FILE_PATH: string;
      AUDIO_OGG_FILE_PATH: string;
      TWILIO_ACCOUNT_SID: string;
      TWILIO_AUTH_TOKEN: string;
      MYSQL_HOST: string;
      MYSQL_PORT?: string;
      MYSQL_USER: string;
      MYSQL_PASSWORD: string;
      MYSQL_DATABASE: string;
      JWT_SECRET: string;
      JWT_REFRESH_SECRET: string;

    }
  }


  declare namespace Express {
    export interface Request {
        user?: {
            id: number;
            nome: string;
            email: string;
        };
    }
}
