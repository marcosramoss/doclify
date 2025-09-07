import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type {
  Project,
  Technology,
  Audience,
  Objective,
  Milestone,
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

    console.log('Elemento encontrado:', element);

    // Create canvas from HTML element
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      ignoreElements: element => {
        // Ignore elements that might cause color parsing issues
        return element.tagName === 'SCRIPT' || element.tagName === 'STYLE';
      },
      onclone: clonedDoc => {
        // Remove any CSS that might contain unsupported color functions
        const styles = clonedDoc.querySelectorAll(
          'style, link[rel="stylesheet"]'
        );
        styles.forEach(style => {
          if (style.textContent && style.textContent.includes('lab(')) {
            style.remove();
          }
        });

        // Force basic styling to avoid color parsing issues
        const basicStyle = clonedDoc.createElement('style');
        basicStyle.textContent = `
          * {
            color: #000000 !important;
            background-color: #ffffff !important;
            border-color: #cccccc !important;
          }
          h1, h2, h3, h4, h5, h6 {
            color: #333333 !important;
          }
          .text-gray-600, .text-gray-500 {
            color: #666666 !important;
          }
        `;
        clonedDoc.head.appendChild(basicStyle);
      },
    });

    console.log('Canvas criado:', canvas.width, 'x', canvas.height);

    const imgData = canvas.toDataURL('image/png');
    console.log('Imagem convertida para base64');

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const imgWidth = 210; // A4 width in mm
    const pageHeight = 295; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    console.log(
      'Dimensões calculadas - Width:',
      imgWidth,
      'Height:',
      imgHeight
    );

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
    const fileName = `${project.title?.replace(/[^a-zA-Z0-9]/g, '_') || 'documento'}_${new Date().toISOString().split('T')[0]}.pdf`;
    console.log('Salvando PDF:', fileName);

    pdf.save(fileName);
    console.log('PDF salvo com sucesso!');

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
  milestones?: Milestone[];
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
    milestones,
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
          <h2 style="color: #333; margin-bottom: 15px;">Equipe</h2>
          <ul style="list-style-type: none; padding: 0; margin: 0;">
            ${members
              .map(
                member => `
              <li style="margin-bottom: 10px;">
                <strong>${member.name}</strong> - ${member.role}
                ${member.email ? `<br><span style="color: #666; font-size: 14px;">${member.email}</span>` : ''}
              </li>
            `
              )
              .join('')}
          </ul>
        </section>
      `
          : ''
      }

      ${
        technologies && technologies.length > 0
          ? `
        <section style="margin-bottom: 30px;">
          <h2 style="color: #333; margin-bottom: 15px;">Tecnologias</h2>
          <ul style="list-style-type: disc; padding-left: 20px; margin: 0;">
            ${technologies
              .map(
                tech => `
              <li style="margin-bottom: 8px;">
                <strong>${tech.name}</strong> (${tech.category})
                ${tech.version ? `<br><span style="color: #666; font-size: 14px;">Versão: ${tech.version}</span>` : ''}
              </li>
            `
              )
              .join('')}
          </ul>
        </section>
      `
          : ''
      }

      ${
        audiences && audiences.length > 0
          ? `
        <section style="margin-bottom: 30px;">
          <h2 style="color: #333; margin-bottom: 15px;">Público-Alvo</h2>
          <ul style="list-style-type: disc; padding-left: 20px; margin: 0;">
            ${audiences
              .map(
                audience => `
              <li style="margin-bottom: 12px;">
                <strong>${audience.name}</strong> (${audience.priority === 'primary' ? 'Primário' : 'Secundário'})
                ${audience.description ? `<br><span style="color: #666; font-size: 14px;">${audience.description}</span>` : ''}
              </li>
            `
              )
              .join('')}
          </ul>
        </section>
      `
          : ''
      }

      ${
        objectives && objectives.length > 0
          ? `
        <section style="margin-bottom: 30px;">
          <h2 style="color: #333; margin-bottom: 15px;">Objetivos</h2>
          <ul style="list-style-type: decimal; padding-left: 20px; margin: 0;">
            ${objectives
              .map(
                objective => `
              <li style="margin-bottom: 15px;">
                <strong>${objective.title}</strong> (Prioridade: ${objective.priority === 'high' ? 'Alta' : objective.priority === 'medium' ? 'Média' : 'Baixa'})
                <br><span style="color: #666; font-size: 14px;">${objective.description}</span>
              </li>
            `
              )
              .join('')}
          </ul>
        </section>
      `
          : ''
      }

      ${
        milestones && milestones.length > 0
          ? `
        <section style="margin-bottom: 30px;">
          <h2 style="color: #333; margin-bottom: 15px;">Marcos do Projeto</h2>
          <ul style="list-style-type: decimal; padding-left: 20px; margin: 0;">
            ${milestones
              .map(
                milestone => `
              <li style="margin-bottom: 15px;">
                <strong>${milestone.title}</strong> (${milestone.status === 'completed' ? 'Concluído' : milestone.status === 'in_progress' ? 'Em Progresso' : 'Pendente'})
                <br><span style="color: #666; font-size: 14px;">Data: ${new Date(milestone.due_date).toLocaleDateString('pt-BR')}</span>
                ${milestone.description ? `<br><span style="color: #666; font-size: 14px;">${milestone.description}</span>` : ''}
              </li>
            `
              )
              .join('')}
          </ul>
        </section>
      `
          : ''
      }

      ${
        requirements_functional && requirements_functional.length > 0
          ? `
        <section style="margin-bottom: 30px;">
          <h2 style="color: #333; margin-bottom: 15px;">Requisitos Funcionais</h2>
          <ol style="padding-left: 20px; margin: 0;">
            ${requirements_functional
              .map(
                (req, index) => `
              <li style="margin-bottom: 15px;">
                <strong>RF${String(index + 1).padStart(2, '0')} - ${req.title}</strong> (${req.priority === 'must_have' ? 'Obrigatório' : req.priority === 'should_have' ? 'Importante' : req.priority === 'could_have' ? 'Desejável' : 'Não será feito'})
                <br><span style="color: #666; font-size: 14px;">${req.description}</span>
                ${req.acceptance_criteria ? `<br><span style="color: #666; font-size: 14px;"><strong>Critérios de Aceitação:</strong> ${req.acceptance_criteria}</span>` : ''}
              </li>
            `
              )
              .join('')}
          </ol>
        </section>
      `
          : ''
      }

      ${
        requirements_non_functional && requirements_non_functional.length > 0
          ? `
        <section style="margin-bottom: 30px;">
          <h2 style="color: #333; margin-bottom: 15px;">Requisitos Não Funcionais</h2>
          <ol style="padding-left: 20px; margin: 0;">
            ${requirements_non_functional
              .map(
                (req, index) => `
              <li style="margin-bottom: 15px;">
                <strong>RNF${String(index + 1).padStart(2, '0')} - ${req.title}</strong> (${req.category})
                <br><span style="color: #666; font-size: 14px;">${req.description}</span>
                ${req.metric && req.target_value ? `<br><span style="color: #666; font-size: 14px;"><strong>Métrica:</strong> ${req.metric} - <strong>Meta:</strong> ${req.target_value}</span>` : ''}
              </li>
            `
              )
              .join('')}
          </ol>
        </section>
      `
          : ''
      }

      ${
        payment
          ? `
        <section style="margin-bottom: 30px;">
          <h2 style="color: #333; margin-bottom: 15px;">Informações de Pagamento</h2>
          <p><strong>Valor Total:</strong> ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: payment.currency || 'BRL' }).format(payment.total_amount)}</p>
          ${payment.payment_terms ? `<p><strong>Condições de Pagamento:</strong> ${payment.payment_terms}</p>` : ''}
          ${payment.milestones ? `<p><strong>Marcos:</strong> ${payment.milestones}</p>` : ''}
        </section>
      `
          : ''
      }

      ${
        stakeholders && stakeholders.length > 0
          ? `
        <section style="margin-bottom: 30px;">
          <h2 style="color: #333; margin-bottom: 15px;">Stakeholders</h2>
          <ul style="list-style-type: none; padding: 0; margin: 0;">
            ${stakeholders
              .map(
                stakeholder => `
              <li style="margin-bottom: 15px;">
                <strong>${stakeholder.name}</strong> - ${stakeholder.role}${stakeholder.signature_required ? ' (Assinatura Obrigatória)' : ''}
                <br><span style="color: #666; font-size: 14px;">${stakeholder.email}</span>
                ${stakeholder.company ? `<br><span style="color: #666; font-size: 14px;">${stakeholder.company}</span>` : ''}
                ${stakeholder.phone ? `<br><span style="color: #666; font-size: 14px;">${stakeholder.phone}</span>` : ''}
              </li>
            `
              )
              .join('')}
          </ul>
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
