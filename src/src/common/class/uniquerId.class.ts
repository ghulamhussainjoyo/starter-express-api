import { v4 as uuid4 } from 'uuid';

class UniquerId {
    generate() {
        return `${uuid4()}-${Date.now()}-${Math.floor(Math.random() * 1000000384738) + 1}`
    }
}

export default new UniquerId()