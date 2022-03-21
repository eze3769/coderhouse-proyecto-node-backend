import { normalize, denormalize, schema } from 'normalizr';
import util from 'util';

export const denormalizeMessages = (obj, entities) => {
    const author = new schema.Entity('author', {}, { idAttribute: 'email' });
    const message = new schema.Entity('text', { author: author },{ idAttribute: 'id' });
    const normalizeFormat = new schema.Entity('messagesCenter', {

      authors: [author],
      messages: [message]
    }, { idAttribute: 'id' });
    
    return denormalize(obj, normalizeFormat, entities);
}

export const normalizeMessages = (obj) =>{
    const author = new schema.Entity('author', {}, {idAttribute: 'email'});
    const text = new schema.Entity('text', { author: author },{ idAttribute: 'id' });
    const messagesCenter= new schema.Entity('messagesCenter', 
        {
            authors: [author],
            messages: [text]
        }, 
        { idAttribute: 'id' }
    );
    
    return normalize(obj, messagesCenter);

}

export const print = (obj) => {
    console.log(util.inspect(obj, false, 12, true));
}



