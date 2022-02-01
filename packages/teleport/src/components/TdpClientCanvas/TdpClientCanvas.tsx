/*
Copyright 2021 Gravitational, Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
import React, { useEffect, useRef, CSSProperties } from 'react';
import { TdpClient, TdpClientEvent } from 'teleport/lib/tdp';
import { PngFrame, ClientScreenSpec } from 'teleport/lib/tdp/codec';

export default function TdpClientCanvas(props: Props) {
  const {
    tdpCli,
    tdpCliOnPngFrame,
    tdpCliOnTdpError,
    tdpCliOnWsClose,
    tdpCliOnWsOpen,
    tdpCliOnClientScreenSpec,
    onKeyDown,
    onKeyUp,
    onMouseMove,
    onMouseDown,
    onMouseUp,
    onMouseWheelScroll,
    onContextMenu,
    style,
  } = props;

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (tdpCli) {
      const canvas = canvasRef.current;
      // Make the canvas a focusable keyboard listener
      // https://stackoverflow.com/a/51267699/6277051
      // https://stackoverflow.com/a/16492878/6277051
      canvas.tabIndex = -1;
      canvas.style.outline = 'none';
      canvas.focus();

      const ctx = canvas.getContext('2d');

      if (tdpCliOnPngFrame) {
        // Buffered rendering logic
        var buffer: PngFrame[] = [];
        const renderBuffer = () => {
          if (buffer.length) {
            for (let i = 0; i < buffer.length; i++) {
              tdpCliOnPngFrame(ctx, buffer[i]);
            }
            buffer = [];
          }
          requestAnimationFrame(renderBuffer);
        };
        requestAnimationFrame(renderBuffer);

        tdpCli.on(TdpClientEvent.TDP_PNG_FRAME, (pngFrame: PngFrame) => {
          buffer.push(pngFrame);
        });
      }

      if (tdpCliOnClientScreenSpec) {
        tdpCli.on(
          TdpClientEvent.TDP_CLIENT_SCREEN_SPEC,
          (spec: ClientScreenSpec) => {
            tdpCliOnClientScreenSpec(canvas, spec);
          }
        );
      }

      if (tdpCliOnTdpError) {
        tdpCli.on(TdpClientEvent.TDP_ERROR, (err: Error) => {
          tdpCliOnTdpError(err);
        });
      }

      if (tdpCliOnWsClose) {
        tdpCli.on(TdpClientEvent.WS_CLOSE, () => {
          tdpCliOnWsClose();
        });
      }

      if (tdpCliOnWsOpen) {
        tdpCli.on(TdpClientEvent.WS_OPEN, () => {
          tdpCliOnWsOpen();
        });
      }

      // Initialize canvas, document, and window event listeners.

      if (onContextMenu) {
        const oncontextmenu = onContextMenu;
        canvas.oncontextmenu = oncontextmenu;
      }

      // Mouse controls.
      if (onMouseMove) {
        const onmousemove = (e: MouseEvent) => {
          onMouseMove(tdpCli, canvas, e);
        };
        canvas.onmousemove = onmousemove;
      }

      if (onMouseDown) {
        const onmousedown = (e: MouseEvent) => {
          onMouseDown(tdpCli, e);
        };
        canvas.onmousedown = onmousedown;
      }

      if (onMouseUp) {
        const onmouseup = (e: MouseEvent) => {
          onMouseUp(tdpCli, e);
        };
        canvas.onmouseup = onmouseup;
      }

      if (onMouseWheelScroll) {
        const onwheel = (e: WheelEvent) => {
          onMouseWheelScroll(tdpCli, e);
        };
        canvas.onwheel = onwheel;
      }

      // Key controls.
      if (onKeyDown) {
        const onkeydown = (e: KeyboardEvent) => {
          onKeyDown(tdpCli, e);
        };
        canvas.onkeydown = onkeydown;
      }

      if (onKeyUp) {
        const onkeyup = (e: KeyboardEvent) => {
          onKeyUp(tdpCli, e);
        };
        canvas.onkeyup = onkeyup;
      }

      tdpCli.init();

      return () => {
        tdpCli.nuke();
        if (onContextMenu)
          canvas.removeEventListener('contextmenu', oncontextmenu);
        if (onMouseMove) canvas.removeEventListener('mousemove', onmousemove);
        if (onMouseDown) canvas.removeEventListener('mousedown', onmousedown);
        if (onMouseUp) canvas.removeEventListener('mouseup', onmouseup);
        if (onKeyDown) canvas.removeEventListener('keydown', onkeydown);
        if (onKeyUp) canvas.removeEventListener('keyup', onkeyup);
        if (onMouseWheelScroll) canvas.removeEventListener('wheel', onwheel);
      };
    }
  }, [tdpCli]);

  return <canvas style={{ ...style }} ref={canvasRef} />;
}

export type Props = {
  tdpCli?: TdpClient;
  tdpCliOnPngFrame?: (
    ctx: CanvasRenderingContext2D,
    pngFrame: PngFrame
  ) => void;
  tdpCliOnTdpError?: (err: Error) => void;
  tdpCliOnWsClose?: () => void;
  tdpCliOnWsOpen?: () => void;
  tdpCliOnClientScreenSpec?: (
    canvas: HTMLCanvasElement,
    spec: ClientScreenSpec
  ) => void;
  onKeyDown?: (cli: TdpClient, e: KeyboardEvent) => void;
  onKeyUp?: (cli: TdpClient, e: KeyboardEvent) => void;
  onMouseMove?: (
    cli: TdpClient,
    canvas: HTMLCanvasElement,
    e: MouseEvent
  ) => void;
  onMouseDown?: (cli: TdpClient, e: MouseEvent) => void;
  onMouseUp?: (cli: TdpClient, e: MouseEvent) => void;
  onMouseWheelScroll?: (cli: TdpClient, e: WheelEvent) => void;
  onContextMenu?: () => void;
  style?: CSSProperties;
};
