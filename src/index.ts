/**
 * TypeDoc plugin to add anchors to external repositories (Bitbucket, Github, etc.)
 * 
 * Inspired by https://github.com/gdelmas/typedoc-plugin-sourcefile-url
 * 
 * @author Rasto Skultety
 */

import { Application, ParameterType, Converter, ReflectionKind } from "typedoc";
import { Context } from "typedoc/dist/lib/converter";
import { SourceReference } from "typedoc/dist/lib/models";

const OPTION_NAME_SOURCEFILE_URL_PREFIX = 'sourcefile-url-prefix';
const OPTION_NAME_SOURCEFILE_LINE_PREFIX = 'sourcefile-line-prefix';

const DEFAULT_SOURCEFILE_LINE_PREFIX = "#L-";

export function load(app: Application) {
    app.options.addDeclaration({
        name: OPTION_NAME_SOURCEFILE_URL_PREFIX,
        help: "Prefix for url of link to source file, e.g. https://www.your-repository.org/",
        type: ParameterType.String,
        defaultValue: "",
    });

    app.options.addDeclaration({
        name: OPTION_NAME_SOURCEFILE_LINE_PREFIX,
        help: "Prefix to use to indicate a specific line in the repository, e.g. #L-",
        type: ParameterType.String, // The default
        defaultValue: DEFAULT_SOURCEFILE_LINE_PREFIX,
    });

    app.converter.on(Converter.EVENT_RESOLVE_END, (context: Context) => {
        const sourcefileUrlPrefix = app.options.getValue(OPTION_NAME_SOURCEFILE_URL_PREFIX) as string;
        const sourcefileLinePrefix = app.options.getValue(OPTION_NAME_SOURCEFILE_LINE_PREFIX) as string;

        if (sourcefileUrlPrefix) {
            const project = context.project;

            // add source file anchors
            project
                .getReflectionsByKind(ReflectionKind.All)
                .forEach(reflection => {
                    reflection?.sources?.forEach((source: SourceReference) => {
                        if (source.fileName) {
                            source.url = sourcefileUrlPrefix + source.fileName + (sourcefileLinePrefix ? sourcefileLinePrefix + source.line : '');
                        }
                    })
                });
        }
    });
}