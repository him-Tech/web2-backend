export class CompanyId {
  id: number;

  constructor(id: number) {
    this.id = id;
  }
}

export class Company {
  id: CompanyId;

  constructor(id: CompanyId) {
    this.id = id;
  }
}
