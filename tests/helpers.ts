import { CourseConfig } from "../lib/types.ts";
// Testing utilities
export async function createTmpDir(prefix: string) {
  return await Deno.makeTempDir({ prefix });
}

export async function cleanUpTmpDir(tmpDirPath: string) {
  const tmpDirPathAsFile = await Deno.open(tmpDirPath);

  Deno.close(tmpDirPathAsFile.rid);
  await Deno.remove(tmpDirPath, { recursive: true });
}

export function getFakeCourseConfig() {
  const course: CourseConfig = {
    name: "Basics of TypeScript",
    author: {
      name: "Joe Previte",
      twitter: "@jsjoeio",
      github: "@jsjoeio",
      website: "https://joeprevite.com",
    },
    modules: [
      {
        title: "How to Read TypeScript",
        number: 1,
        completed: false,
        lessons: [
          {
            title: "Annotations",
            number: 1,
            completed: false,
            sublessons: [
              {
                title: "Parameter Type Annotations",
                number: 1,
                completed: false,
                exercises: [
                  {
                    title: "Write Your Own",
                    number: 1,
                    skippable: false,
                    didSkip: undefined,
                    completed: false,
                    answerType: "subStringMatch",
                    answers: ["a: number, b: number"],
                  },
                  {
                    title: "In The Wild",
                    number: 2,
                    skippable: true,
                    didSkip: false,
                    completed: false,
                    answerType: "subStringMatch",
                    answers: ["https://github.com", "https://gitlab.com"],
                  },
                  {
                    title: "Meta",
                    number: 3,
                    skippable: true,
                    didSkip: false,
                    completed: false,
                    answerType: "subStringMatch",
                    answers: ["https://github.com", "https://gitlab.com"],
                  },
                ],
                quiz: [
                  {
                    title: "Do parameters always need to be annotated?",
                    number: 1,
                    skippable: false,
                    completed: false,
                    answers: ["yes"],
                  },
                  {
                    title:
                      "Type annotations are defined using what single character?",
                    number: 2,
                    skippable: false,
                    completed: false,
                    answers: [":", "colon"],
                  },
                  {
                    title:
                      "What is the type for the parameter used in the `helloWorld` example from the lesson?",
                    number: 3,
                    skippable: false,
                    completed: false,
                    answers: ["string"],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  };
  return course;
}
