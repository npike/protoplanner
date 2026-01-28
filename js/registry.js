/**
 * ComponentRegistry handles the storage and retrieval of component definitions.
 */
class Registry {
    constructor() {
        this.mapping = {};
    }

    register(definition) {
        if (!definition.type) return;
        this.mapping[definition.type] = definition;
        console.log(`Registered component: ${definition.name}`);
    }

    get(type) {
        return this.mapping[type];
    }

    list() {
        return Object.values(this.mapping);
    }
}

const ComponentRegistry = new Registry();
