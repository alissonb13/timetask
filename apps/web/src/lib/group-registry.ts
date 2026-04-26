interface RegistryEntry {
  id: string;
  name: string;
  deletedAt: Date | null;
}

let registry: RegistryEntry[] = [];

export const groupRegistry = {
  update(groups: RegistryEntry[]) {
    registry = groups;
  },
  findByName(name: string): RegistryEntry | undefined {
    return registry.find(
      (g) => g.name.toLowerCase() === name.toLowerCase() && !g.deletedAt,
    );
  },
  findById(id: string): RegistryEntry | undefined {
    return registry.find((g) => g.id === id);
  },
};
