import JSZip from 'jszip';
import {
  BlueprintFileType,
  BlueprintParser,
  ParseStatus
} from '../../src/blueprint/blueprint-parser';

describe('BlueprintParser DOCX', () => {
  const parser = BlueprintParser.getInstance();

  const createDocx = async (documentXml?: string): Promise<Buffer> => {
    const archive = new JSZip();
    archive.file('[Content_Types].xml', '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"/>');
    if (documentXml) archive.file('word/document.xml', documentXml);
    archive.file(
      'word/header1.xml',
      '<w:hdr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:p><w:r><w:t>ORUS Blueprint</w:t></w:r></w:p></w:hdr>'
    );
    return archive.generateAsync({ type: 'nodebuffer' });
  };

  it('extracts ordered text from WordprocessingML documents', async () => {
    const buffer = await createDocx(
      '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>Atlas Health</w:t></w:r></w:p><w:p><w:r><w:t>Agenda</w:t><w:tab/><w:t>Pacientes</w:t><w:br/><w:t>Prontuários</w:t></w:r></w:p></w:body></w:document>'
    );

    const result = await parser.uploadBlueprint(
      'atlas.docx',
      BlueprintFileType.DOCX,
      buffer,
      'test-user'
    );

    expect(result.parseStatus).toBe(ParseStatus.COMPLETED);
    expect(result.rawContent).toContain('Atlas Health');
    expect(result.rawContent).toContain('Agenda\tPacientes\nProntuários');
    expect(result.rawContent).toContain('ORUS Blueprint');
  });

  it('rejects DOCX packages without a main document', async () => {
    const buffer = await createDocx();
    const result = await parser.uploadBlueprint(
      'invalid.docx',
      BlueprintFileType.DOCX,
      buffer,
      'test-user'
    );

    expect(result.parseStatus).toBe(ParseStatus.FAILED);
    expect(result.parseError).toContain('word/document.xml');
  });
});
