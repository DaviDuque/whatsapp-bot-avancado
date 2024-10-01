import SummarizeServiceInterface from "../domain/service/summarize.service.interface";

export class SummarizeService implements SummarizeServiceInterface {
    async summarize(text:string): Promise<string> {
        return '';
    }
}