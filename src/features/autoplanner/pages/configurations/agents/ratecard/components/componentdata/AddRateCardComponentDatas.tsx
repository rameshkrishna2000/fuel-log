import { Typography } from '@mui/material';
import { ColumnDef } from '@tanstack/react-table';
import { useMemo, useState } from 'react';

type AddOn = {
  addOnId?: any;
  name?: string;
  addCost?: number;
  startTime?: number;
  endTime?: number;
};

type Seater = {
  seaterId?: any;
  seater: number;
  baseCost: number;
  addOns: AddOn[];
};

type Tour = {
  tourId?: any;
  tourName: string;
  mode: string;
  isAddOn?: boolean;
  seaters: Seater[];
};

export const useAddRateCardComponentData = ({ seatersList, isMobile }: any) => {
  const [editingRow, setEditingRow] = useState<number | null>(null);

  const seaterColumns: ColumnDef<Tour>[] = useMemo(
    () =>
      seatersList?.data
        ?.map((seaterNum: any) => ({
          id: `${seaterNum}`,
          header: `Seater ${seaterNum}`,
          accessorFn: (row: any) => {
            const seaterData = row.seaters?.find(
              (s: { seater: any }) => s.seater === seaterNum
            );
            return seaterData?.baseCost ?? '';
          },
          cell: (info: any) => {
            const value = info.getValue();
            return <div>{value}</div>;
          }
        }))
        .sort((a: any, b: any) => a.id - b.id) ?? [],
    [seatersList?.data]
  );

  const columns: ColumnDef<Tour>[] = useMemo(
    () => [
      {
        accessorKey: 'tourName',
        id: 'tourName',
        header: 'Tour Name',
        cell: (info: any) => {
          const value = info.getValue();
          return (
            <Typography
              variant={isMobile ? 'body2' : 'body1'}
              noWrap={isMobile}
              title={value}
            >
              {value}
            </Typography>
          );
        }
      },
      ...seaterColumns
    ],
    [seaterColumns]
  );

  return { seaterColumns, columns, setEditingRow, editingRow };
};
