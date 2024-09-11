export class CompanyId {
  id: number;

  constructor(id: number) {
    this.id = id;
  }
}

export class Company {
  id: CompanyId;
  uuid: string;

  constructor(id: CompanyId) {
    this.id = id;
  }
}
