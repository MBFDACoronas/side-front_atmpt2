export interface TableColumn {
  name: string;
  value: string;
  width: string;
  sort: boolean;
  filter: { type: string };
}
