class Tool {
  name = "BaseTool";
  description = "Base tool description";

  call(input: string | null): any {
    throw new Error("Not implemented");
  }
}
export default Tool;
