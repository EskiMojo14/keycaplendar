import React from "react";
import { useTheme } from "@nivo/core";
import { PointTooltipProps, SliceTooltipProps } from "@nivo/line";
import { TableTooltip, Chip } from "@nivo/tooltip";

export const PointTooltip = ({ point }: PointTooltipProps) => {
  const theme = useTheme();
  return (
    <TableTooltip
      rows={[
        [
          <Chip key="chip" color={point.serieColor} style={theme.tooltip.chip} />,
          point.serieId,
          point.data.xFormatted,
          <span key="value" style={theme.tooltip.tableCellValue}>
            {point.data.yFormatted}
          </span>,
        ],
      ]}
    />
  );
};

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
