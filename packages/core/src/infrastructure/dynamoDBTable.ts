import { TableResources, Table as _Table } from "sst/node/table";

interface ITable extends TableResources {
    Events: any;
    LinkRedirector: any;
}

export const Table: ITable = _Table as ITable;
