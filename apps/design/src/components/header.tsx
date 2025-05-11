import { Button, Dropdown, DropdownOption, Layout, Space, Tooltip } from 'tdesign-react';
import DesignContext from '../context/designContext';
import { JSX, useContext, useEffect, useState } from 'react';
import { ArtboardIcon, BarcodeIcon, ChartBarIcon, ChartLineIcon, ChartPieIcon, ChevronDownIcon, GestureRanslationIcon, LettersZIcon, NavigationArrowIcon, SlashIcon, TableIcon } from 'tdesign-icons-react'
import { ToolType } from '@canvas/design/tool/tpyes';
const { Header } = Layout;


export const DesignHeader = () => {
  const design = useContext(DesignContext);

  const getIcons: Record<ToolType, JSX.Element> = {
    select: <NavigationArrowIcon className="rotate-[-45deg] w-[20px!important] h-[20px!important] " />,
    DRAWTEMPLATE: <ArtboardIcon className=" w-[20px!important] h-[20px!important]" />,
    drawText: <LettersZIcon className=" w-[20px!important] h-[20px!important]" />,
    drawLine: <SlashIcon className=" w-[20px!important] h-[20px!important]" />,
    drawBarcode: <BarcodeIcon className=" w-[20px!important] h-[20px!important]" />,
    drawTable: <TableIcon className=" w-[20px!important] h-[20px!important]" />,
    drawBar: <ChartBarIcon className=" w-[20px!important] h-[20px!important]" />,
    drawChartLine: <ChartLineIcon className=" w-[20px!important] h-[20px!important]" />,
    drawPie: <ChartPieIcon className=" w-[20px!important] h-[20px!important]" />,
    drag: <GestureRanslationIcon className=" w-[20px!important] h-[20px!important]" />,
  }
  const [toolList, setToolList] = useState<{ key: ToolType; value: string; }[]>([])

  const [currentTool, setCurrentTool] = useState("select")

  const [zoom, setZoom] = useState(1)


  const changeTool = (tool: ToolType) => {
    design?.activeTool(tool)
  }

  function zoomChange(zoom: number) {
    setZoom(zoom)
  }
  useEffect(() => {
    if (design) {
      setToolList(design.sceneGraph.tool.getTools())
      design.zoom.on('zoomChange', zoomChange)
      design.sceneGraph.tool.on('onChange', setCurrentTool)
    }
  }, [design])


  function saveJson() {
    const data = design?.getJson()
    localStorage.setItem('data', JSON.stringify(data))
  }

  const options = [
    {
      content: '放大 ctrl+',
      value: 'add',
    },

    {
      content: '缩小 ctrl-',
      value: 'sub',
    },
  ]

  const clickHandler: ((dropdownItem: DropdownOption, context: {
    e: React.MouseEvent<HTMLDivElement>;
  }) => void) | undefined = (data) => {
    const type = data.value
    switch (type) {
      case 'add':
        design?.zoom?.zoomIn()
        break
      case 'sub':
        design?.zoom?.zoomOut()
        break
      default:
        break
    }
  }

  return <>
    <Header className="border-b h-[65px] border-slate-100">
      <div className="w-full h-full flex justify-between items-center pl-[32px] ">
        <Space>
          {
            toolList?.map(it =>
              <Tooltip
                content={it.value}
                destroyOnClose
                showArrow
                theme="default"
              >
                <div
                  onClick={() => changeTool(it.key)}
                  style={{ color: currentTool === it.key ? "white" : 'gray' }}
                  className={`w-[40px] h-[40px]  rounded-[8px] flex justify-center items-center ${currentTool === it.key
                    ? 'bg-[#38bdf8] '
                    : ''
                    }`}
                >
                  {getIcons[it.key]}
                </div>
              </Tooltip>
            )
          }
        </Space>

        <Space className="flex items-center">
          <Button
            onClick={saveJson}
            className="  active:opacity-60   w-[80px] p-[8px] bg-[#38bdf8] text-white rounded"
          >
            保存
          </Button>
          <Dropdown options={options} onClick={clickHandler}>
            <Button
              variant="text"
              suffix={<ChevronDownIcon size="16" />}
            >
              {Math.round(zoom * 100)}%
            </Button>
          </Dropdown>
        </Space>
      </div>
    </Header>
  </>
}