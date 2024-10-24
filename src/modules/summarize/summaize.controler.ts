import * as dotenv from 'dotenv';
dotenv.config();

import { SummarizeService } from '../../infra/integrations/summarize.service';
import { SummarizeController } from './summarize.repository';
import { MessageMemoryRepository } from '../../infra/memory/message-memory.repository';


    export const summarize = async(Body: string) => {
      

    if(Body){
        const summarizeService = new SummarizeService();
        const messageRepository = new MessageMemoryRepository();

        const summarizeController = new SummarizeController(
            summarizeService,
            messageRepository
        );

        const response = await summarizeController.execute({
           body: Body,
        });
        
        if (!response) {
            return Body;
        }

        return response;
    }else{
        return Body;
    }
    
};





