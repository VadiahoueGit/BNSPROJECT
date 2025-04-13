import { ScalePoint, ScaleTime, ScaleLinear } from 'd3-scale';
import {ScaleType} from "@swimlane/ngx-charts";

export declare function getScale(
  domain: number[],
  range: number[],
  scaleType: ScaleType,
  roundDomains: boolean
): ScaleTime<number, number> | ScaleLinear<number, number> | ScalePoint<string>;
