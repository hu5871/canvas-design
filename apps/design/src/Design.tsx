import { useEffect, useRef, useState } from "react"
import DesignContext from "./context/designContext"
import Design from '@canvas/design'
import { DesignHeader } from "./components/header";
import { Button, Layout,  } from "tdesign-react";
import { IGraphicsInfo, IPoint } from "@canvas/design/types";
import { IMenuItem } from "@canvas/design/tool/menu";
import {Attr} from "@/components/attr"
const { Content } = Layout

export const DesignEl = () => {
  const [design, setDesign] = useState<Design | null>(null);
  const [menu, setMenu] = useState<IMenuItem[]>([])
  const [contextPoint, setContextPoint] = useState<IPoint | null>(null)
  const [rect, setRect] = useState<IGraphicsInfo | null | undefined>(null)

  function handlePoint(e: IPoint) {
    setContextPoint(e)
  }
  function maskContextMenu(e: React.MouseEvent<HTMLElement>) {
    e.preventDefault()
  }

  function closeMenu(e: React.MouseEvent<HTMLElement>) {
    e.preventDefault()
    e.stopPropagation()
    setMenu([])
  }

  function handlerMenuClick(e: React.MouseEvent<HTMLElement>, type = '') {
    e.preventDefault()
    e.stopPropagation()
    design?.sceneGraph?.activeMenu(type)
  }
  const containerRef = useRef<HTMLDivElement | null>(null)
  function failMsg() {
    console.log(rect)
  }

  function setRectFun (r:IGraphicsInfo){
    setRect({...r})
  }


  useEffect(() => {
    if (!containerRef.current) return
    const data = JSON.parse(localStorage.getItem('data') ?? `[]`)
    const designIns = new Design({
      target: containerRef.current,
      data,
    })

    designIns.sceneGraph.on('contentmenu', handlePoint)
    designIns.sceneGraph.on('getMenuList', setMenu)
    designIns.sceneGraph.tool.on('editFail', failMsg)
    designIns.sceneGraph.on('selected', setRectFun)
    designIns.sceneGraph.on('attrsChange', setRectFun)
    setDesign(designIns)
    return () => {
      designIns.destroy()
      setDesign(null)
    }
  }, [])
  return (
    <DesignContext.Provider value={design}>
      <Layout className="h-full">
        <DesignHeader />
        <Content  id="content" className="flex"> 
          <div ref={containerRef} id="design" className="flex-1" style={{ height: '100%' }}></div>
          {menu.length && contextPoint ? (
            <div
              className="fixed top-[0px] bottom-[0px] left-[0px] right-[0px] z-[99]  "
              onContextMenu={maskContextMenu}
              onClick={closeMenu}
            >
              <div
                style={{
                  top: `${contextPoint?.y}px`,
                  left: `${contextPoint?.x}px`
                }}
                className={`absolute  w-[200px] bg-[red] z-[100]`}
                onClick={handlerMenuClick}
              >
                {menu.map((item) => {
                  return (
                    <div key={item.type}>
                      <Button
                        onClick={(e) =>
                          handlerMenuClick(e, item.type)
                        }
                        disabled={item.disabled}
                        className="w-full rounded-none"
                        theme="default"
                        variant="outline"
                      >
                        {item.label}
                      </Button>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : null}

          <div className="w-[350px] p-[16px] bg-[white] h-full"
          >
            {rect ?  <Attr rect={rect} /> : null} 
          </div>
        </Content>

      </Layout>
    </DesignContext.Provider>
  )
}