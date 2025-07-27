import DesignContext from "@/context/designContext"
import { IGraphicsInfo } from "@canvas/design/types"
import { useContext, useEffect, } from "react"
import { Col, Form, InputNumber, Row, InputNumberValue, } from "tdesign-react"
import FormItem from "tdesign-react/es/form/FormItem"
interface Props {
  rect: IGraphicsInfo
}
export const Attr: React.FC<Props> = ({
  rect
}) => {

  const design = useContext(DesignContext);

  const [form] = Form.useForm();
  useEffect(() => {
    if (!rect) return
    form.setFieldsValue?.({ width: rect.width.toFixed(2) });
    form.setFieldsValue?.({ height: rect.height.toFixed(2) });
    form.setFieldsValue?.({ x: rect.x.toFixed(2) });
    form.setFieldsValue?.({ y: rect.y.toFixed(2) });
    form.setFieldsValue?.({ rotate: rect.rotate.toFixed(2) });
  }, [rect, form])



  const onChange = (key: string, value: InputNumberValue) => {
   console.log("触发了")
    design?.emit("updateByGrapicsAttr", {
      key, value
    })
  }
  return <>
    <Form form={form} layout="inline" className="" labelWidth={'3em'}>
      <Row gutter={[16, 16]}>
        <Col span={6} >
          <FormItem label="宽度" name="width">
            <InputNumber theme="normal" className="w-11/12" onBlur={(val) => onChange('width', val)} />
          </FormItem>
        </Col>
        <Col span={6} >
          <FormItem label="高度" name="height">
            <InputNumber theme="normal" className="w-11/12" onBlur={(val) => onChange('height', val)} />
          </FormItem>
        </Col>
        <Col span={6} >
          <FormItem label="坐标X" name="x">
            <InputNumber theme="normal" className="w-11/12" onBlur={(val) => onChange('x', val)} />
          </FormItem>
        </Col>
        <Col span={6} >
          <FormItem label="坐标Y" name="y">
            <InputNumber theme="normal" className="w-11/12" onBlur={(val) => onChange('y', val)} />
          </FormItem>
        </Col>
        <Col span={6} >
          <FormItem label="旋转" name="rotate">
            <InputNumber theme="normal" className="w-11/12" onBlur={(val) => onChange('rotate', val)} />
          </FormItem>
        </Col>
      </Row>
    </Form>
  </>
}