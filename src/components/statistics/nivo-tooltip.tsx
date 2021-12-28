import { useTheme } from "@nivo/core";
import type { PointTooltipProps, SliceTooltipProps } from "@nivo/line";
import { BasicTooltip, Chip, TableTooltip } from "@nivo/tooltip";

export const PointTooltip = ({
  point: {
    serieId,
    data: { xFormatted, yFormatted },
    color,
  },
}: PointTooltipProps) => <BasicTooltip id={`${serieId} - ${xFormatted}`} value={yFormatted} enableChip color={color} />;

export const SliceTooltip = ({ slice, axis }: SliceTooltipProps) => {
  const theme = useTheme();
  const otherAxis = axis === "x" ? "y" : "x";

  return (
    <TableTooltip
      rows={slice.points
        .filter((point) => point.data[otherAxis] > 0)
        .map((point) => [
          <Chip key="chip" color={point.serieColor} style={theme.tooltip.chip} />,
          point.serieId,
          point.data[`${axis}Formatted`],
          <span key="value" style={theme.tooltip.tableCellValue}>
            {point.data[`${otherAxis}Formatted`]}
          </span>,
        ])}
    />
  );
};
