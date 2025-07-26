export interface IntuitUserProfile {
  sub: string;
  email: string;
  emailVerified: boolean;
  givenName?: string;
  familyName?: string;
  phoneNumber?: string;
  realmId: string;
}

export interface CompanyInfo {
  QueryResponse: {
    CompanyInfo: Array<{
      Name: string;
      CompanyAddr?: {
        Line1?: string;
        City?: string;
        CountrySubDivisionCode?: string;
        PostalCode?: string;
        Country?: string;
      };
      LegalAddr?: {
        Line1?: string;
        City?: string;
        CountrySubDivisionCode?: string;
        PostalCode?: string;
        Country?: string;
      };
      Email?: {
        Address: string;
      };
      WebAddr?: {
        URI: string;
      };
      FiscalYearStartMonth?: string;
      Country?: string;
      Id: string;
      MetaData: {
        CreateTime: string;
        LastUpdatedTime: string;
      };
    }>;
  };
}