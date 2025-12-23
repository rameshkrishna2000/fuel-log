import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TableViewIcon from '@mui/icons-material/TableView';
import CustomButtonGroup from '../custombuttongroup/CustomButtonGroup';

import { useAppDispatch, useAppSelector } from '../../../../app/redux/hooks';
import { boolean } from 'yup';
import { useCallback, useEffect, useState } from 'react';
import {
  getAutoplannerPDFExcel,
  Payload
} from '../../../redux/reducer/commonSlices/reportSlice';

interface DocPayLoad {
  readonly docPayload: {
    reportType: string;
    pdfURL?: string;
    excelURL?: string;
    payload: Payload;
  };
}

const options = [
  {
    label: 'Download as PDF',
    value: 'pdf',
    icon: <PictureAsPdfIcon />
  },
  {
    label: 'Download as Excel',
    value: 'excel',
    icon: <TableViewIcon />
  }
];

function CustomToolbar({ docPayload }: DocPayLoad): React.JSX.Element {
  let { reportType, payload } = docPayload;
  const { pdfURL } = useAppSelector((state: any) => state?.pdfURL ?? '');
  const { excelURL } = useAppSelector((state: any) => state?.excelURL ?? '');
  const { data: url } = useAppSelector((state: any) => state.autoPDFExcel);
  const [load, setLoad] = useState<boolean>(false);
  const [report, setReport] = useState('');
  const [format, setFormat] = useState('');
  const dispatch = useAppDispatch();

  // Function for downloading the report as PDF & Excel:
  const reportDownload = async (docType: string) => {
    setFormat(docType);
    setLoad(true);
    setReport(reportType);

    await dispatch(getAutoplannerPDFExcel({ ...payload, format: docType.toLowerCase() }));
    setLoad(false);
  };

  useEffect(() => {
    if (pdfURL && report === reportType) {
      downloadPdfExcel(pdfURL.pdfUrl, 'pdf');
    }
  }, [pdfURL]);

  useEffect(() => {
    if (excelURL && report === reportType) {
      downloadPdfExcel(excelURL.excelUrl, 'excel');
    }
  }, [excelURL]);

  useEffect(() => {
    if (url) {
      downloadPdfExcel(url, format);
    }
  }, [url, format]);
  //function to download pdf and excel
  const downloadPdfExcel = async (pdfURL: string, docType: string) => {
    try {
      const response = await fetch(pdfURL);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download =
        docType === 'pdf'
          ? `${reportType?.split(/(?=[A-Z])/).join(' ')} Report.pdf`
          : `${reportType?.split(/(?=[A-Z])/).join(' ')} Report.xlsx`;
      link.click();

      // Clean up the Object URL after the download:
      URL.revokeObjectURL(url);
    } catch (error) {
      console.log(error, 'eroor');
    }
  };

  return (
    <CustomButtonGroup
      options={options}
      handleClick={reportDownload}
      load={load}
      label='download'
    />
  );
}

export default CustomToolbar;
