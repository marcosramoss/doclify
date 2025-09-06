import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type {
  Project,
  Technology,
  Audience,
  Objective,
  FunctionalRequirement,
  NonFunctionalRequirement,
  PaymentInfo,
  Stakeholder,
} from '@/types';

/**
 * Export project data to PDF
 */
export const exportToPDF = async (
  project: Project,
  elementId: string = 'document-content'
) => {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error('Element not found for PDF export');
    }

    // Create canvas from HTML element
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');

    const imgWidth = 210; // A4 width in mm
    const pageHeight = 295; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    // Add first page
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Add additional pages if needed
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // Save the PDF
    const fileName = `${project.title || 'documento'}_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);

    return { success: true, fileName };
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// Extended project type for export
interface ExtendedProject extends Project {
  technologies?: Technology[];
  audiences?: Audience[];
  objectives?: Objective[];
  requirements_functional?: FunctionalRequirement[];
  requirements_non_functional?: NonFunctionalRequirement[];
  payment?: PaymentInfo;
  stakeholders?: Stakeholder[];
}

/**
 * Generate document content as HTML string for export
 */
export const generateDocumentHTML = (project: ExtendedProject) => {
  const {
    title,
    description,
    company_name,
    members,
    technologies,
    audiences,
    objectives,
    requirements_functional,
    requirements_non_functional,
    payment,
    stakeholders,
  } = project;

  return `
    <div id="document-content" style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6;">
      <header style="text-align: center; margin-bottom: 40px; border-bottom: 2px solid #333; padding-bottom: 20px;">
        <h1 style="color: #333; margin-bottom: 10px;">${title}</h1>
        ${company_name ? `<h2 style="color: #666; font-weight: normal;">${company_name}</h2>` : ''}
        ${description ? `<p style="color: #666; font-style: italic;">${description}</p>` : ''}
        <p style="color: #999; font-size: 14px;">Gerado em ${new Date().toLocaleDateString('pt-BR')}</p>
      </header>

      ${
        members && members.length > 0
          ? `
        <section style="margin-bottom: 30px;">
          <h2 style="color: #333; border-bottom: 1px solid #ddd; padding-bottom: 10px;">Equipe</h2>
          <div style="display: grid; gap: 10px;">
            ${members
              .map(
                member => `
              <div style="padding: 10px; border: 1px solid #eee; border-radius: 5px;">
                <strong>${member.name}</strong> - ${member.role}
                ${member.email ? `<br><small style="color: #666;">${member.email}</small>` : ''}
              </div>
            `
              )
              .join('')}
          </div>
        </section>
      `
          : ''
      }

      ${
        technologies && technologies.length > 0
          ? `
        <section style="margin-bottom: 30px;">
          <h2 style="color: #333; border-bottom: 1px solid #ddd; padding-bottom: 10px;">Tecnologias</h2>
          <div style="display: grid; gap: 10px;">
            ${technologies
              .map(
                tech => `
              <div style="padding: 10px; border: 1px solid #eee; border-radius: 5px;">
                <strong>${tech.name}</strong>
                <span style="background: #f0f0f0; padding: 2px 8px; border-radius: 3px; font-size: 12px; margin-left: 10px;">${tech.category}</span>
                ${tech.version ? `<br><small style="color: #666;">Versão: ${tech.version}</small>` : ''}
              </div>
            `
              )
              .join('')}
          </div>
        </section>
      `
          : ''
      }

      ${
        audiences && audiences.length > 0
          ? `
        <section style="margin-bottom: 30px;">
          <h2 style="color: #333; border-bottom: 1px solid #ddd; padding-bottom: 10px;">Público-Alvo</h2>
          <div style="display: grid; gap: 10px;">
            ${audiences
              .map(
                audience => `
              <div style="padding: 10px; border: 1px solid #eee; border-radius: 5px;">
                <strong>${audience.name}</strong>
                <span style="background: ${audience.priority === 'primary' ? '#e3f2fd' : '#f3e5f5'}; padding: 2px 8px; border-radius: 3px; font-size: 12px; margin-left: 10px;">${audience.priority === 'primary' ? 'Primário' : 'Secundário'}</span>
                ${audience.description ? `<br><p style="margin: 5px 0 0 0; color: #666;">${audience.description}</p>` : ''}
              </div>
            `
              )
              .join('')}
          </div>
        </section>
      `
          : ''
      }

      ${
        objectives && objectives.length > 0
          ? `
        <section style="margin-bottom: 30px;">
          <h2 style="color: #333; border-bottom: 1px solid #ddd; padding-bottom: 10px;">Objetivos</h2>
          <div style="display: grid; gap: 10px;">
            ${objectives
              .map(
                objective => `
              <div style="padding: 10px; border: 1px solid #eee; border-radius: 5px;">
                <strong>${objective.title}</strong>
                <span style="background: ${objective.priority === 'high' ? '#ffebee' : objective.priority === 'medium' ? '#fff3e0' : '#e8f5e8'}; padding: 2px 8px; border-radius: 3px; font-size: 12px; margin-left: 10px;">${objective.priority === 'high' ? 'Alta' : objective.priority === 'medium' ? 'Média' : 'Baixa'}</span>
                <p style="margin: 5px 0 0 0; color: #666;">${objective.description}</p>
              </div>
            `
              )
              .join('')}
          </div>
        </section>
      `
          : ''
      }

      ${
        requirements_functional && requirements_functional.length > 0
          ? `
        <section style="margin-bottom: 30px;">
          <h2 style="color: #333; border-bottom: 1px solid #ddd; padding-bottom: 10px;">Requisitos Funcionais</h2>
          <div style="display: grid; gap: 10px;">
            ${requirements_functional
              .map(
                (req, index) => `
              <div style="padding: 10px; border: 1px solid #eee; border-radius: 5px;">
                <strong>RF${String(index + 1).padStart(2, '0')} - ${req.title}</strong>
                <span style="background: ${req.priority === 'must_have' ? '#ffebee' : req.priority === 'should_have' ? '#fff3e0' : req.priority === 'could_have' ? '#e8f5e8' : '#f5f5f5'}; padding: 2px 8px; border-radius: 3px; font-size: 12px; margin-left: 10px;">${req.priority === 'must_have' ? 'Obrigatório' : req.priority === 'should_have' ? 'Importante' : req.priority === 'could_have' ? 'Desejável' : 'Não será feito'}</span>
                <p style="margin: 5px 0 0 0; color: #666;">${req.description}</p>
                ${req.acceptance_criteria ? `<p style="margin: 5px 0 0 0; color: #666; font-size: 14px;"><strong>Critérios de Aceitação:</strong> ${req.acceptance_criteria}</p>` : ''}
              </div>
            `
              )
              .join('')}
          </div>
        </section>
      `
          : ''
      }

      ${
        requirements_non_functional && requirements_non_functional.length > 0
          ? `
        <section style="margin-bottom: 30px;">
          <h2 style="color: #333; border-bottom: 1px solid #ddd; padding-bottom: 10px;">Requisitos Não Funcionais</h2>
          <div style="display: grid; gap: 10px;">
            ${requirements_non_functional
              .map(
                (req, index) => `
              <div style="padding: 10px; border: 1px solid #eee; border-radius: 5px;">
                <strong>RNF${String(index + 1).padStart(2, '0')} - ${req.title}</strong>
                <span style="background: #e3f2fd; padding: 2px 8px; border-radius: 3px; font-size: 12px; margin-left: 10px;">${req.category}</span>
                <p style="margin: 5px 0 0 0; color: #666;">${req.description}</p>
                ${req.metric && req.target_value ? `<p style="margin: 5px 0 0 0; color: #666; font-size: 14px;"><strong>Métrica:</strong> ${req.metric} - <strong>Meta:</strong> ${req.target_value}</p>` : ''}
              </div>
            `
              )
              .join('')}
          </div>
        </section>
      `
          : ''
      }

      ${
        payment
          ? `
        <section style="margin-bottom: 30px;">
          <h2 style="color: #333; border-bottom: 1px solid #ddd; padding-bottom: 10px;">Informações de Pagamento</h2>
          <div style="padding: 15px; border: 1px solid #eee; border-radius: 5px; background: #f9f9f9;">
            <p><strong>Valor Total:</strong> ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: payment.currency || 'BRL' }).format(payment.total_amount)}</p>
            ${payment.payment_terms ? `<p><strong>Condições de Pagamento:</strong> ${payment.payment_terms}</p>` : ''}
            ${payment.milestones ? `<p><strong>Marcos:</strong> ${payment.milestones}</p>` : ''}
          </div>
        </section>
      `
          : ''
      }

      ${
        stakeholders && stakeholders.length > 0
          ? `
        <section style="margin-bottom: 30px;">
          <h2 style="color: #333; border-bottom: 1px solid #ddd; padding-bottom: 10px;">Stakeholders</h2>
          <div style="display: grid; gap: 10px;">
            ${stakeholders
              .map(
                stakeholder => `
              <div style="padding: 10px; border: 1px solid #eee; border-radius: 5px;">
                <strong>${stakeholder.name}</strong> - ${stakeholder.role}
                ${stakeholder.signature_required ? '<span style="background: #ffebee; padding: 2px 8px; border-radius: 3px; font-size: 12px; margin-left: 10px;">Assinatura Obrigatória</span>' : ''}
                <br><small style="color: #666;">${stakeholder.email}</small>
                ${stakeholder.company ? `<br><small style="color: #666;">${stakeholder.company}</small>` : ''}
                ${stakeholder.phone ? `<br><small style="color: #666;">${stakeholder.phone}</small>` : ''}
              </div>
            `
              )
              .join('')}
          </div>
        </section>
      `
          : ''
      }

      <footer style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666; font-size: 12px;">
        <p>Documento gerado pelo Doclify em ${new Date().toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </footer>
    </div>
  `;
};
