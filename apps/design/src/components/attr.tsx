import { IRect } from "@canvas/design/types"
import { useEffect,  } from "react"
import { Col, Form, InputNumber, Row, } from "tdesign-react"
import FormItem from "tdesign-react/es/form/FormItem"
interface Props {
  rect: IRect
}
export const Attr: React.FC<Props> = ({
  rect
}) => {
  const [form] = Form.useForm();
  useEffect(() => {
    if(!rect) return 
    form.setFieldsValue?.({ width: rect.width.toFixed(2) });
    form.setFieldsValue?.({ height: rect.height.toFixed(2) });
    form.setFieldsValue?.({ x: rect.x.toFixed(2) });
    form.setFieldsValue?.({ y: rect.y.toFixed(2) });
  }, [rect, form])
  return <>
    <Form form={form} layout="inline" className="" labelWidth={'3em'}>
      <Row gutter={[16,16]}>
        <Col span={6} >
          <FormItem label="宽度" name="width">
            <InputNumber theme="normal" className="w-11/12" />
          </FormItem>
        </Col>
        <Col span={6} >
          <FormItem label="高度" name="height">
            <InputNumber theme="normal" className="w-11/12" />
          </FormItem>
        </Col>
        <Col span={6} >
          <FormItem label="坐标X" name="x">
            <InputNumber theme="normal" className="w-11/12" />
          </FormItem>
        </Col>
        <Col span={6} >
          <FormItem label="坐标Y" name="y">
            <InputNumber theme="normal" className="w-11/12" />
          </FormItem>
        </Col>
      </Row>
    </Form>
  </>
}