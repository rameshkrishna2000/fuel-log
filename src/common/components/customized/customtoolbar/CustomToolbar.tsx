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
import { Label } from '@mui/icons-material';

interface DocPayLoad {
  readonly docPayload?: {
    reportType: string;
    pdfURL?: string;
    excelURL?: string;
    payload: Payload;
  };
  readonly reportDownload?: (docType: string) => Promise<void>;
  readonly label?: string;
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

function CustomToolbar({
  docPayload,
  reportDownload: propsReportDownload,
  label
}: DocPayLoad): React.JSX.Element {
  let reportType = docPayload?.reportType || '';
  let payload = docPayload?.payload;
  const { pdfURL } = useAppSelector((state: any) => state?.pdfURL ?? '');
  const { excelURL } = useAppSelector((state: any) => state?.excelURL ?? '');
  const { data: url } = useAppSelector((state: any) => state.autoPDFExcel);
  const { data: fuelUrl } = useAppSelector((state: any) => state.addFuelExcel);
  const [load, setLoad] = useState<boolean>(false);
  const [report, setReport] = useState('');
  const [format, setFormat] = useState('');
  const dispatch = useAppDispatch();

  // Default function for downloading the report as PDF & Excel:
  const defaultReportDownload = async (docType: string) => {
    setFormat(docType);
    setLoad(true);
    setReport(reportType);

    await dispatch(
      getAutoplannerPDFExcel({ ...payload, foramat: docType.toLowerCase() })
    );
    setLoad(false);
  };

  // Use props reportDownload if available, otherwise use default
  const reportDownload = propsReportDownload || defaultReportDownload;

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

  useEffect(() => {
    if (fuelUrl) {
      downloadPdfExcel(fuelUrl, format);
    }
  }, [fuelUrl, format]);

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
    } catch (error) {}
  };

  return (
    <CustomButtonGroup
      options={options}
      handleClick={reportDownload}
      load={load}
      label={label ? label : 'download'}
    />
  );
}

export default CustomToolbar;
