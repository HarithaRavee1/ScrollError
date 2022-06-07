import React from 'react';
import 'devextreme/data/odata/store';
import DataGrid, {
  Column,
  Scrolling
} from 'devextreme-react/data-grid';
import { Link } from 'react-router-dom';
import { reportsData, order, dataTypeMap, additionalColumns } from "./reports.js"
export const KEYTERM = "KeyTerm";
export const STANDARD_OBJECT = "StandardObject";
export const STANDARD_OBJECT_VALUE_SPLITTER = "_|_";

class Reports extends React.Component {

  updateColumnDetails = (data) => {
    data = JSON.parse(JSON.stringify(data))
    if (reportsData && reportsData.column_types) {
      let additionalColumnDetails = reportsData.column_types;
      additionalColumns.forEach((row) => {
        let type = row.type;
        if (type === KEYTERM) {
          let keyTerm = row.name;
          row.data_elements.forEach((dataElement) => {
            additionalColumnDetails[`${keyTerm}.${dataElement}`] = { ...additionalColumnDetails[`${keyTerm}.${dataElement}`], ...{ keyTerm, dataElement, type } };
          });
        } else if (type === STANDARD_OBJECT) {
          let table = row.name;
          row.columns.forEach((ktDe) => {
            let val = ktDe.split(STANDARD_OBJECT_VALUE_SPLITTER);
            additionalColumnDetails[`${table}.${ktDe}`] = { ...additionalColumnDetails[`${table}.${ktDe}`], ...{ keyTerm: val[0], dataElement: val[1], type } };
          });
        }
      });
      reportsData.column_types = additionalColumnDetails;
    }
    return reportsData;
  };

  getAdditionalColumnComponents = (commonOptions, data) => {
    let columns = [];
    const additionalColumnDetails = data.column_types;
    if (additionalColumnDetails) {
      order.forEach((column) => {
        let termApiData = additionalColumnDetails[column];
        if (!termApiData) {
          return;
        }
        let label = termApiData.label;
        if (column === "account_name") {
          columns.push(
            <Column
              key="account_name"
              {...commonOptions}
              caption={label}
              dataField={column}
              calculateCellValue={(data) => data.account_name}
              cellRender={(colProps) => {
                return (
                  <a
                    className="ui link"
                    href={`/accounts/${colProps.data.account_id}`}
                    target="_blank"
                  >
                    {colProps.data.account_name}
                  </a>
                );
              }}
            />
          );
        } else if (column === "document_title") {
          columns.push(
            <Column
              key="document_title"
              {...commonOptions}
              width={300}
              caption={label}
              dataField={column}
              calculateCellValue={(data) => data.document_title}
              cellRender={(colProps) => (
                <a
                  className="ui link"
                  href={`/accounts/${colProps.data.account_id}/documents/${colProps.data.pramata_number}`}
                  target="_blank"
                >
                  {colProps.data.document_title}
                </a>
              )}
            />
          );
        } else if (column === "contract_type") {
          columns.push(
            <Column
              key="contract_type"
              {...commonOptions}
              caption={label}
              dataField={column}
              calculateCellValue={(data) => data.contract_type}
            />
          );
        } else if (column === "pramata_number") {
          columns.push(
            <Column
              key="pramata_number"
              {...commonOptions}
              caption={label}
              dataField={column}
              cellRender={(colProps) => colProps.data.pramata_number}
            />
          );
        } else {
          let allowSorting = { allowSorting: true };
          let dataType = dataTypeMap[termApiData.data_type];
          allowSorting.allowSorting = dataType ? true : false;
          columns.push(
            <Column
              key={column}
              dataField={column}
              caption={label}
              {...{ ...commonOptions, ...allowSorting }}
              dataType={dataType || "string"}
              calculateCellValue={(data) => {
                let termData = data[`${termApiData.keyTerm}.${termApiData.dataElement}`];
                return termData ? termData[0] : null;
              }}
            />
          );
        }
      });
    }
    return columns;
  };
  
  render() {
    let commonOptions = {
      allowHiding: false,
      allowSorting: true,
      width: 150,
      alignment: "left"
    };
    let data = this.updateColumnDetails(reportsData);
    let dataSource =
      data && data.data && data.columns
        ? {
          store: {
            type: "array",
            data: data.data.map((item) => {
              let option = {};
              data.columns.forEach((key, index) => {
                option[key] = item[index];
              });
              return option;
            }),
            key: "contract_id",
          },
        }
        : [];
    return (
      <DataGrid
        key="reports-container"
        dataSource={dataSource}
        showBorders={true}
        columnAutoWidth={true}
        showRowLines={true}
        allowColumnResizing={true}
        columnResizingMode={"widget"}
        allowColumnReordering={true}
        id="reports-container"
        height={"500px"}
        columnMinWidth={80}
        width={"100%"}
      >
        <Scrolling mode="virtual" rowRenderingMode="virtual" useNative={true} />
        {this.getAdditionalColumnComponents(commonOptions, data)}
      </DataGrid>
    )
  }
}
export default Reports;

